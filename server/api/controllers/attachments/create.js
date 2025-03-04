const Errors = {
  NOT_ENOUGH_RIGHTS: {
    notEnoughRights: 'Not enough rights',
  },
  CARD_NOT_FOUND: {
    cardNotFound: 'Card not found',
  },
};

module.exports = {
  inputs: {
    cardId: {
      type: 'string',
      regex: /^[0-9]+$/,
      required: true,
    },
    requestId: {
      type: 'string',
      isNotEmptyString: true,
    },
  },

  exits: {
    notEnoughRights: {
      responseType: 'forbidden',
    },
    cardNotFound: {
      responseType: 'notFound',
    },
    uploadError: {
      responseType: 'unprocessableEntity',
    },
  },

  async fn(inputs, exits) {
    const { currentUser } = this.req;

    const { card } = await sails.helpers.cards
      .getProjectPath(inputs.cardId)
      .intercept('pathNotFound', () => Errors.CARD_NOT_FOUND);

    const boardMembership = await BoardMembership.findOne({
      boardId: card.boardId,
      userId: currentUser.id,
    });

    if (!boardMembership) {
      throw Errors.CARD_NOT_FOUND; // Forbidden
    }

    if (boardMembership.role !== BoardMembership.Roles.EDITOR) {
      throw Errors.NOT_ENOUGH_RIGHTS;
    }

    this.req
      .file('file')
      .upload(sails.helpers.utils.createAttachmentReceiver(), async (error, files) => {
        if (error) {
          return exits.uploadError(error.message);
        }

        if (files.length === 0) {
          return exits.uploadError('No file was uploaded');
        }

        const file = files[0];

        const attachment = await sails.helpers.attachments.createOne(
          {
            ...file.extra,
            filename: file.filename,
          },
          currentUser,
          card,
          inputs.requestId,
          this.req,
        );

        return exits.success({
          item: attachment.toJSON(),
        });
      });
  },
};
