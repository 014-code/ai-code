import {useRef, useState} from 'react';
import {Button, message, Space, Typography, Tag} from 'antd';
import {PlusOutlined, HistoryOutlined} from '@ant-design/icons';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import type {ActionType} from '@ant-design/pro-components';
import type {ProColumns} from '@ant-design/pro-table';
import {deleteUser, listUserVoByPage} from '@/services/backend/userController';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';
import PointsModal from './components/PointsModal';

/**
 * 用户管理页面（管理员）
 * 用于管理所有用户账号信息
 */
const UserAdminPage: React.FC = () => {
    // 模态框显示状态
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
    const [pointsModalVisible, setPointsModalVisible] = useState<boolean>(false);
    const tableRef = useRef<ActionType>();
    const [currentRow, setCurrentRow] = useState<API.User>();

    /**
     * 处理删除用户
     * @param row 要删除的用户数据
     * @returns 是否删除成功
     */
    const handleDelete = (row: API.User) => {
        const hide = message.loading('正在删除');
        if (!row) return true;
        deleteUser({
            id: row.id,
        }).then(() => {
            hide();
            message.success('删除成功');
            tableRef?.current?.reload();
            return true;
        }).catch((error) => {
            hide();
            message.error('删除失败，' + error.message);
            return false;
        });
    };

    /**
     * 表格列配置
     */
    const columns: ProColumns<API.User>[] = [
        {
            title: 'id',
            dataIndex: 'id',
            valueType: 'text',
            hideInForm: true,
        },
        {
            title: '账号',
            dataIndex: 'userAccount',
            valueType: 'text',
        },
        {
            title: '用户名',
            dataIndex: 'userName',
            valueType: 'text',
        },
        {
            title: '头像',
            dataIndex: 'userAvatar',
            valueType: 'image',
            fieldProps: {
                width: 64,
            },
            hideInSearch: true,
        },
        {
            title: '简介',
            dataIndex: 'userProfile',
            valueType: 'textarea',
        },
        {
            title: '权限',
            dataIndex: 'userRole',
            valueEnum: {
                user: {
                    text: '用户',
                },
                admin: {
                    text: '管理员',
                },
            },
        },
        {
            title: '积分',
            dataIndex: 'userPoints',
            valueType: 'text',
            hideInSearch: true,
            render: (text: number) => {
                if (text === undefined || text === null) return 0;
                return <Tag color="blue">{text}</Tag>;
            },
        },
        {
            title: '创建时间',
            sorter: true,
            dataIndex: 'createTime',
            valueType: 'dateTime',
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: '更新时间',
            sorter: true,
            dataIndex: 'updateTime',
            valueType: 'dateTime',
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            render: (_, record) => (
                <Space size="middle">
                    <Typography.Link
                        onClick={() => {
                            setCurrentRow(record);
                            setUpdateModalVisible(true);
                        }}
                    >
                        修改
                    </Typography.Link>
                    <Typography.Link
                        onClick={() => {
                            setCurrentRow(record);
                            setPointsModalVisible(true);
                        }}
                    >
                        <HistoryOutlined/> 积分记录
                    </Typography.Link>
                    <Typography.Link type="danger" onClick={() => handleDelete(record)}>
                        删除
                    </Typography.Link>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer>
            <ProTable<API.User>
                headerTitle={'用户管理'}
                actionRef={tableRef}
                rowKey="key"
                search={{
                    labelWidth: 120,
                }}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="primary"
                        onClick={() => {
                            setCreateModalVisible(true);
                        }}
                    >
                        <PlusOutlined/> 新建用户
                    </Button>,
                ]}
                request={async (params, sort, filter) => {
                    const sortField = Object.keys(sort)?.[0];
                    const sortOrder = sort?.[sortField] ?? undefined;

                    const {data, code} = await listUserVoByPage({
                        ...params,
                        sortField,
                        sortOrder,
                        ...filter,
                    } as API.UserQueryRequest);

                    return {
                        success: code === 0,
                        data: data?.records || [],
                        total: data?.total || 0,
                    };
                }}
                columns={columns}
            />
            {/* 创建用户模态框 */}
            <CreateModal
                visible={createModalVisible}
                columns={columns}
                onSubmit={() => {
                    setCreateModalVisible(false);
                    tableRef.current?.reload();
                }}
                onCancel={() => {
                    setCreateModalVisible(false);
                }}
            />
            {/* 修改用户模态框 */}
            <UpdateModal
                visible={updateModalVisible}
                columns={columns}
                oldData={currentRow}
                onSubmit={() => {
                    setUpdateModalVisible(false);
                    setCurrentRow(undefined);
                    tableRef.current?.reload();
                }}
                onCancel={() => {
                    setUpdateModalVisible(false);
                }}
            />
            {/* 积分记录模态框 */}
            <PointsModal
                visible={pointsModalVisible}
                userId={currentRow?.id}
                onCancel={() => {
                    setPointsModalVisible(false);
                    setCurrentRow(undefined);
                }}
            />
        </PageContainer>
    );
};

export default UserAdminPage;
