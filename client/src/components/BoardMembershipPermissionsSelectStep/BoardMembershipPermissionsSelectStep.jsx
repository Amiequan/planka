import omit from 'lodash/omit';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button, Form, Menu, Radio, Segment } from 'semantic-ui-react';
import { Popup } from '../../lib/custom-ui';

import { BoardMembershipRoles } from '../../constants/Enums';

import styles from './BoardMembershipPermissionsSelectStep.module.scss';

const BoardMembershipPermissionsSelectStep = React.memo(
  ({ defaultData, title, buttonContent, onSelect, onBack }) => {
    const [t] = useTranslation();

    const [data, setData] = useState(() => ({
      role: BoardMembershipRoles.EDITOR,
      canComment: null,
      ...defaultData,
    }));

    const handleRoleSelectClick = useCallback((role) => {
      setData((prevData) => ({
        ...prevData,
        role,
        canComment: role === BoardMembershipRoles.EDITOR ? null : !!prevData.canComment,
      }));
    }, []);

    const handleSettingChange = useCallback((_, { name: fieldName, checked: value }) => {
      setData((prevData) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }, []);

    const handleSubmit = useCallback(() => {
      onSelect(data.role === BoardMembershipRoles.EDITOR ? omit(data, 'canComment') : data);
    }, [onSelect, data]);

    return (
      <>
        <Popup.Header onBack={onBack}>
          {t(title, {
            context: 'title',
          })}
        </Popup.Header>
        <Popup.Content>
          <Form onSubmit={handleSubmit}>
            <Menu secondary vertical className={styles.menu}>
              <Menu.Item
                active={data.role === BoardMembershipRoles.EDITOR}
                onClick={() => handleRoleSelectClick(BoardMembershipRoles.EDITOR)}
              >
                <div className={styles.menuItemTitle}>{t('common.editor')}</div>
                <div className={styles.menuItemDescription}>
                  {t('common.canEditContentOfBoard')}
                </div>
              </Menu.Item>
              <Menu.Item
                active={data.role === BoardMembershipRoles.VIEWER}
                onClick={() => handleRoleSelectClick(BoardMembershipRoles.VIEWER)}
              >
                <div className={styles.menuItemTitle}>{t('common.viewer')}</div>
                <div className={styles.menuItemDescription}>{t('common.canOnlyViewBoard')}</div>
              </Menu.Item>
            </Menu>
            {data.role !== BoardMembershipRoles.EDITOR && (
              <Segment basic className={styles.settings}>
                <Radio
                  toggle
                  name="canComment"
                  checked={data.canComment}
                  label={t('common.canComment')}
                  onChange={handleSettingChange}
                />
              </Segment>
            )}
            <Button positive content={t(buttonContent)} />
          </Form>
        </Popup.Content>
      </>
    );
  },
);

BoardMembershipPermissionsSelectStep.propTypes = {
  defaultData: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  title: PropTypes.string,
  buttonContent: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

BoardMembershipPermissionsSelectStep.defaultProps = {
  defaultData: undefined,
  title: 'common.selectPermissions',
  buttonContent: 'action.selectPermissions',
};

export default BoardMembershipPermissionsSelectStep;
