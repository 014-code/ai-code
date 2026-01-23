import {useRef, useState} from 'react';
import {Button, message, Space, Typography} from 'antd';
import {PlusOutlined} from '@ant-design/icons';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import type {ActionType} from '@ant-design/pro-components';
import type {ProColumns} from '@ant-design/pro-table';
import {deleteCodeSnippet, getCodeSnippets} from '@/services/backend/codeSnippetController';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';

const DEFAULT_PAGE_SIZE = 10;
const TABLE_SCROLL_X = 1200;
const SEARCH_LABEL_WIDTH = 120;
const SEARCH_SPAN = 8;
const COLUMN_WIDTHS = {
    id: 80,
    snippetName: 150,
    snippetType: 120,
    snippetCategory: 120,
    snippetDesc: 200,
    usageScenario: 150,
    tags: 150,
    isActive: 80,
    priority: 80,
    creatorId: 100,
    createTime: 160,
    updateTime: 160,
    option: 120,
};

const CodeSnippetAdminPage: React.FC = () => {
    const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
    const actionRef = useRef<ActionType>();
    const [currentRow, setCurrentRow] = useState<API.CodeSnippet>();

    const handleDelete = async (row: API.CodeSnippet) => {
        const hide = message.loading('正在删除');
        if (!row) return true;
        try {
            await deleteCodeSnippet({
                id: row.id as undefined,
            });
            hide();
            message.success('删除成功');
            actionRef?.current?.reload();
            return true;
        } catch (error) {
            hide();
            message.error('删除失败，' + error.message);
            return false;
        }
    };

    const fetchCodeSnippets = async (params, sort, filter) => {
        const {data, code} = await getCodeSnippets({
            snippetType: filter.snippetType,
            category: filter.snippetCategory,
            tags: filter.tags,
        });

        const allData = data || [];
        const pageSize = params.pageSize || 10;
        const current = params.current || 1;
        const startIndex = (current - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageData = allData.slice(startIndex, endIndex);

        return {
            success: code === 0,
            data: pageData,
            total: allData.length,
        };
    };

    const columns: ProColumns<API.CodeSnippet>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            valueType: 'text',
            width: COLUMN_WIDTHS.id,
            hideInForm: true,
        },
        {
            title: '片段名称',
            dataIndex: 'snippetName',
            valueType: 'text',
            width: COLUMN_WIDTHS.snippetName,
            ellipsis: true,
        },
        {
            title: '片段类型',
            dataIndex: 'snippetType',
            valueType: 'text',
            width: COLUMN_WIDTHS.snippetType,
            ellipsis: true,
            valueEnum: {
                'function': {text: '函数'},
                'class': {text: '类'},
                'component': {text: '组件'},
                'hook': {text: 'Hook'},
                'util': {text: '工具函数'},
                'other': {text: '其他'},
            },
        },
        {
            title: '分类',
            dataIndex: 'snippetCategory',
            valueType: 'text',
            width: COLUMN_WIDTHS.snippetCategory,
            ellipsis: true,
            valueEnum: {
                'frontend': {text: '前端'},
                'backend': {text: '后端'},
                'database': {text: '数据库'},
                'config': {text: '配置'},
                'test': {text: '测试'},
                'other': {text: '其他'},
            },
        },
        {
            title: '描述',
            dataIndex: 'snippetDesc',
            valueType: 'textarea',
            width: COLUMN_WIDTHS.snippetDesc,
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '代码片段',
            dataIndex: 'snippetCode',
            valueType: 'textarea',
            width: 250,
            ellipsis: true,
            hideInSearch: true,
            render: (text) => (
                <div style={{
                    maxWidth: '250px',
                    maxHeight: '60px',
                    overflow: 'hidden',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
                    fontSize: '12px',
                    backgroundColor: '#f5f5f5',
                    padding: '4px 8px',
                    borderRadius: '4px',
                }}>
                    {text}
                </div>
            ),
        },
        {
            title: '使用场景',
            dataIndex: 'usageScenario',
            valueType: 'text',
            width: COLUMN_WIDTHS.usageScenario,
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '标签',
            dataIndex: 'tags',
            valueType: 'text',
            width: COLUMN_WIDTHS.tags,
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'isActive',
            valueType: 'select',
            width: COLUMN_WIDTHS.isActive,
            valueEnum: {
                0: {text: '禁用', status: 'Default'},
                1: {text: '启用', status: 'Success'},
            },
            hideInSearch: true,
        },
        {
            title: '优先级',
            dataIndex: 'priority',
            valueType: 'digit',
            width: COLUMN_WIDTHS.priority,
            hideInSearch: true,
        },
        {
            title: '创建者ID',
            dataIndex: 'creatorId',
            valueType: 'text',
            width: COLUMN_WIDTHS.creatorId,
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            valueType: 'dateTime',
            width: COLUMN_WIDTHS.createTime,
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: '更新时间',
            dataIndex: 'updateTime',
            valueType: 'dateTime',
            width: COLUMN_WIDTHS.updateTime,
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            width: COLUMN_WIDTHS.option,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Typography.Link
                        onClick={() => {
                            setCurrentRow(record);
                            setUpdateModalVisible(true);
                        }}
                    >
                        修改
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
            <ProTable<API.CodeSnippet>
                headerTitle={'代码模板管理'}
                actionRef={actionRef}
                rowKey="id"
                search={{
                    labelWidth: SEARCH_LABEL_WIDTH,
                    span: SEARCH_SPAN,
                    defaultCollapsed: false,
                }}
                scroll={{x: TABLE_SCROLL_X}}
                pagination={{
                    pageSize: DEFAULT_PAGE_SIZE,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
                toolBarRender={() => [
                    <Button
                        type="primary"
                        key="primary"
                        onClick={() => {
                            setCreateModalVisible(true);
                        }}
                    >
                        <PlusOutlined/> 新建模板
                    </Button>,
                ]}
                request={fetchCodeSnippets}
                columns={columns}
            />
            <CreateModal
                visible={createModalVisible}
                columns={columns}
                onSubmit={() => {
                    setCreateModalVisible(false);
                    actionRef.current?.reload();
                }}
                onCancel={() => {
                    setCreateModalVisible(false);
                }}
            />
            <UpdateModal
                visible={updateModalVisible}
                columns={columns}
                oldData={currentRow}
                onSubmit={() => {
                    setUpdateModalVisible(false);
                    setCurrentRow(undefined);
                    actionRef.current?.reload();
                }}
                onCancel={() => {
                    setUpdateModalVisible(false);
                }}
            />
        </PageContainer>
    );
};

export default CodeSnippetAdminPage;
