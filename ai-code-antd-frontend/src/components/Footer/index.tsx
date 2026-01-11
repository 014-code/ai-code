import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';

/**
 * 页脚组件
 * 显示版权信息和外部链接
 * @returns React 组件
 */
const Footer: React.FC = () => {
  const defaultMessage = '014';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'codeNav',
          title: '014的github',
          href: 'https://github.com/014-code',
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
