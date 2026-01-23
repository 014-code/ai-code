import {useState} from 'react';
import {Button, Card, Col, Descriptions, Input, message, Modal, Row, Space, Statistic, Typography} from 'antd';
import {GiftOutlined, UserAddOutlined, UserSwitchOutlined} from '@ant-design/icons';
import {PageContainer} from '@ant-design/pro-components';
import {
    initializePointsForAllUsers,
    initializePointsForUser,
    grantPointsForAdmins,
} from '@/services/backend/dataRepairController';

const {Title, Paragraph} = Typography;
const {Search} = Input;

const DataRepairAdminPage: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [userPointsLoading, setUserPointsLoading] = useState<boolean>(false);
    const [adminPointsLoading, setAdminPointsLoading] = useState<boolean>(false);
    const [points, setPoints] = useState<number>(100);

    const handleInitializeAllUsers = async () => {
        Modal.confirm({
            title: '确认操作',
            content: '确定要为所有现有用户初始化积分账户吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                setLoading(true);
                try {
                    const {data} = await initializePointsForAllUsers();
                    message.success(data?.message || '初始化成功');
                } catch (error) {
                    message.error('初始化失败，' + error.message);
                }
                setLoading(false);
            },
        });
    };

    const handleInitializeUser = async (userId: string) => {
        if (!userId) {
            message.warning('请输入用户ID');
            return;
        }

        setUserPointsLoading(true);
        try {
            const {data} = await initializePointsForUser({
                userId: parseInt(userId),
                points,
            });
            if (data) {
                message.success('初始化成功');
            }
        } catch (error) {
            message.error('初始化失败，' + error.message);
        }
        setUserPointsLoading(false);
    };

    const handleGrantAdminPoints = async () => {
        Modal.confirm({
            title: '确认操作',
            content: '确定要为所有管理员账号发放积分吗？',
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                setAdminPointsLoading(true);
                try {
                    const {data} = await grantPointsForAdmins({points});
                    message.success(data?.message || '发放成功');
                } catch (error) {
                    message.error('发放失败，' + error.message);
                }
                setAdminPointsLoading(false);
            },
        });
    };

    return (
        <PageContainer>
            <div style={{marginBottom: 24}}>
                <Paragraph type="secondary">
                    提供数据修复和初始化功能，仅管理员可访问
                </Paragraph>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={8} lg={8}>
                    <Card>
                        <Statistic
                            title="批量初始化用户积分"
                            value="所有用户"
                            prefix={<UserAddOutlined/>}
                        />
                        <div style={{marginTop: 16}}>
                            <Button
                                type="primary"
                                block
                                loading={loading}
                                onClick={handleInitializeAllUsers}
                                icon={<GiftOutlined/>}
                            >
                                批量初始化
                            </Button>
                        </div>
                        <div style={{marginTop: 8, fontSize: 12, color: '#999'}}>
                            为所有现有用户初始化积分账户，默认赠送100积分
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={24} md={8} lg={8}>
                    <Card>
                        <Statistic
                            title="管理员发放积分"
                            value="管理员"
                            prefix={<UserSwitchOutlined/>}
                        />
                        <div style={{marginTop: 16}}>
                            <Input
                                type="number"
                                placeholder="积分数量"
                                value={points}
                                onChange={(e) => setPoints(parseInt(e.target.value) || 100)}
                                style={{marginBottom: 8}}
                                min={1}
                            />
                            <Button
                                type="primary"
                                block
                                loading={adminPointsLoading}
                                onClick={handleGrantAdminPoints}
                                icon={<GiftOutlined/>}
                            >
                                发放积分
                            </Button>
                        </div>
                        <div style={{marginTop: 8, fontSize: 12, color: '#999'}}>
                            为所有管理员账号发放指定数量的积分
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={24} md={8} lg={8}>
                    <Card>
                        <Statistic
                            title="单个用户初始化"
                            value="指定用户"
                            prefix={<UserAddOutlined/>}
                        />
                        <div style={{marginTop: 16}}>
                            <Search
                                placeholder="请输入用户ID"
                                enterButton="初始化"
                                loading={userPointsLoading}
                                onSearch={handleInitializeUser}
                                style={{marginBottom: 8}}
                            />
                            <Input
                                type="number"
                                placeholder="积分数量（默认100）"
                                value={points}
                                onChange={(e) => setPoints(parseInt(e.target.value) || 100)}
                                min={1}
                            />
                        </div>
                        <div style={{marginTop: 8, fontSize: 12, color: '#999'}}>
                            为指定用户初始化积分账户
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card title="功能说明" style={{marginTop: 24}}>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="批量初始化用户积分">
                        为所有现有用户创建积分账户并赠送初始积分。如果用户已有积分账户，则跳过。
                    </Descriptions.Item>
                    <Descriptions.Item label="管理员发放积分">
                        为所有管理员账号发放指定数量的积分。管理员拥有无限额度，但仍会记录流水用于审计。
                    </Descriptions.Item>
                    <Descriptions.Item label="单个用户初始化">
                        为指定用户创建积分账户并赠送初始积分。可以自定义赠送的积分数量。
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </PageContainer>
    );
};

export default DataRepairAdminPage;
