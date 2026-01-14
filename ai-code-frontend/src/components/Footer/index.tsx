import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

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