import React, {useEffect, useState} from 'react';
import {listSpaceByPage, addSpace, deleteSpace} from '@/services/backend/spaceController';
import {Button, Card, message, Modal, Form, Input, Select, Row, Col, Empty, Spin} from 'antd';
import SpaceCard from "@/components/SpaceCard";
import {PlusOutlined, TeamOutlined, UserOutlined} from "@ant-design/icons";
import {SpaceTypeEnum, SPACE_TYPE_CONFIG} from "@/constants/spaceTypeEnum";
import styles from './index.module.less';

const {TextArea} = Input;
const {Option} = Select;

const DEFAULT_PAGE_SIZE = 8;

const SpaceListPage: React.FC = () => {
    const [spaces, setSpaces] = useState<[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [form] = Form.useForm();

    const loadSpaces = async () => {
        setLoading(true);
        try {
            const {data} = await listSpaceByPage({pageNum: 1, pageSize: DEFAULT_PAGE_SIZE});
            setSpaces(data?.records || []);
            setTotal(data?.totalRow || 0);
        } catch (error) {
            message.error('加载空间列表失败');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadSpaces();
    }, []);

    const handleCreateSpace = async (values) => {
        setCreateLoading(true);
        try {
            await addSpace({
                spaceName: values.spaceName,
                spaceType: values.spaceType,
                spaceDesc: values.spaceDesc,
            });
            message.success('创建成功');
            setCreateModalVisible(false);
            form.resetFields();
            loadSpaces();
        } catch (error) {
            message.error('创建失败:' + error.message);
        }
        setCreateLoading(false);
    };

    const handleDeleteSpace = async (spaceId: string) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个空间吗？删除后无法恢复。',
            onOk: async () => {
                try {
                    await deleteSpace({id: spaceId});
                    message.success('删除成功');
                    loadSpaces();
                } catch (error) {
                    message.error('删除失败:' + error.message);
                }
            },
        });
    };

    const handleEditSpace = () => {
        message.info('编辑功能待实现');
    };

    return (
        <div className={styles.spaceListContainer}>
            <Card
                title="我的空间"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        创建空间
                    </Button>
                }
            >
                <Spin spinning={loading}>
                    {spaces.length > 0 ? (
                        <Row gutter={[24, 24]}>
                            {spaces.map(space => (
                                <Col xs={24} sm={12} md={8} lg={8} xl={6} xxl={6} key={space.id}>
                                    <SpaceCard
                                        space={space}
                                        onEdit={handleEditSpace}
                                        onDelete={handleDeleteSpace}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <p>暂无空间</p>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined/>}
                                        onClick={() => setCreateModalVisible(true)}
                                    >
                                        创建第一个空间
                                    </Button>
                                </div>
                            }
                        />
                    )}
                </Spin>
            </Card>

            <Modal
                title="创建空间"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateSpace}
                >
                    <Form.Item
                        label="空间名称"
                        name="spaceName"
                        rules={[{required: true, message: '请输入空间名称'}]}
                    >
                        <Input placeholder="请输入空间名称" maxLength={50}/>
                    </Form.Item>

                    <Form.Item
                        label="空间类型"
                        name="spaceType"
                        rules={[{required: true, message: '请选择空间类型'}]}
                    >
                        <Select placeholder="请选择空间类型">
                            {Object.values(SpaceTypeEnum).filter((type) => typeof type === 'number').map((type) => (
                                <Option key={type} value={type}>
                                    {type === SpaceTypeEnum.PERSONAL ? (
                                        <><UserOutlined/> {SPACE_TYPE_CONFIG[type as SpaceTypeEnum]?.label}</>
                                    ) : (
                                        <><TeamOutlined/> {SPACE_TYPE_CONFIG[type as SpaceTypeEnum]?.label}</>
                                    )}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="空间描述"
                        name="spaceDesc"
                    >
                        <TextArea
                            placeholder="请输入空间描述（可选）"
                            rows={4}
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={createLoading}
                            block
                            size="large"
                        >
                            创建空间
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SpaceListPage;
