import {updateUser} from '@/services/backend/userController';
import {ProTable} from '@ant-design/pro-components';
import type {ProColumns} from '@ant-design/pro-table';
import {message, Modal} from 'antd';

interface Props {
    oldData?: API.User;
    visible: boolean;
    columns: ProColumns<API.User>[];
    onSubmit: (values: API.UserAddRequest) => void;
    onCancel: () => void;
}

const handleUpdate = (fields: API.UserUpdateRequest) => {
    const hide = message.loading('正在更新');
    return updateUser(fields).then(() => {
        hide();
        message.success('更新成功');
        return true;
    }).catch((error) => {
        hide();
        message.error('更新失败，' + error.message);
        return false;
    });
};

const UpdateModal: React.FC<Props> = (props) => {
    const {oldData, visible, columns, onSubmit, onCancel} = props;

    if (!oldData) {
        return <></>;
    }

    return (
        <Modal
            destroyOnClose
            title={'更新'}
            open={visible}
            footer={null}
            onCancel={() => {
                onCancel?.();
            }}
        >
            <ProTable
                type="form"
                columns={columns}
                form={{
                    initialValues: oldData,
                }}
                onSubmit={(values: API.UserAddRequest) => {
                    handleUpdate({
                        ...values,
                        id: oldData.id,
                    }).then(success => {
                        if (success) {
                            onSubmit?.(values);
                        }
                    });
                }}
            />
        </Modal>
    );
};
export default UpdateModal;
