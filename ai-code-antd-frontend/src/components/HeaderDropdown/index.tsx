import { Dropdown } from 'antd';
import type { DropDownProps } from 'antd/es/dropdown';
import React from 'react';
import { useEmotionCss } from '@ant-design/use-emotion-css';
import classNames from 'classnames';

/**
 * 头部下拉菜单组件属性接口
 */
export type HeaderDropdownProps = {
  overlayClassName?: string;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

/**
 * 头部下拉菜单组件
 * 在小屏幕下自适应宽度
 * @param props - 组件属性
 * @returns React 组件
 */
const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, ...restProps }) => {
  const className = useEmotionCss(({ token }) => {
    return {
      [`@media screen and (max-width: ${token.screenXS})`]: {
        width: '100%',
      },
    };
  });
  return <Dropdown overlayClassName={classNames(className, cls)} {...restProps} />;
};

export default HeaderDropdown;
