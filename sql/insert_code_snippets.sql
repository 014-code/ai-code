-- 代码片段模板导入数据
-- 来源：code-snippet-prompt.md
-- 生成时间：2026-01-18

INSERT INTO `code_snippet` (`snippet_name`, `snippet_type`, `snippet_category`, `snippet_desc`, `snippet_code`, `usage_scenario`, `tags`, `is_active`, `priority`, `creator_id`) VALUES
('响应式按钮样式模板', 'component', 'css', '简约现代的按钮样式，适用于不同屏幕，支持悬停和禁用效果', '/* CSS变量 */\n:root {\n  --button-bg: #007bff;\n  --button-hover: #0056b3;\n  --button-disabled: #6c757d;\n  --button-radius: 4px;\n  --button-padding: 10px 20px;\n  --button-font-size: 14px;\n  --button-transition: all 0.3s ease;\n}\n\n/* 基础按钮样式 */\n.button {\n  background-color: var(--button-bg);\n  color: white;\n  padding: var(--button-padding);\n  font-size: var(--button-font-size);\n  border-radius: var(--button-radius);\n  border: none;\n  cursor: pointer;\n  transition: var(--button-transition);\n}\n\n.button:hover {\n  background-color: var(--button-hover);\n}\n\n.button:disabled {\n  background-color: var(--button-disabled);\n  cursor: not-allowed;\n}\n\n/* 响应式设计 */\n@media (max-width: 768px) {\n  .button {\n    width: 100%;\n    padding: 12px;\n  }\n}', '适用于响应式按钮，兼容各种设备大小', 'button,responsive,hover,disabled', 1, 100, 1),

('卡片布局模板', 'layout', 'css', '简洁的卡片布局，适用于产品展示或信息卡片，支持悬停和阴影效果', '/* CSS变量 */\n:root {\n  --card-bg: #fff;\n  --card-border: #ddd;\n  --card-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);\n  --card-radius: 8px;\n  --card-padding: 20px;\n  --card-transition: all 0.3s ease;\n}\n\n/* 卡片样式 */\n.card {\n  background-color: var(--card-bg);\n  border: 1px solid var(--card-border);\n  border-radius: var(--card-radius);\n  box-shadow: var(--card-shadow);\n  padding: var(--card-padding);\n  transition: var(--card-transition);\n}\n\n.card:hover {\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);\n}\n\n/* 响应式设计 */\n@media (max-width: 768px) {\n  .card {\n    padding: 16px;\n  }\n}', '适用于展示内容卡片、产品卡片等', 'card,layout,hover,shadow', 1, 100, 1),

('现代输入框样式模板', 'component', 'css', '简单清新的输入框样式，支持焦点效果、占位符和禁用状态', '/* CSS变量 */\n:root {\n  --input-border: #ccc;\n  --input-focus: #007bff;\n  --input-bg: #fff;\n  --input-placeholder: #aaa;\n  --input-radius: 4px;\n  --input-padding: 10px;\n}\n\n/* 输入框样式 */\n.input {\n  width: 100%;\n  padding: var(--input-padding);\n  border-radius: var(--input-radius);\n  border: 1px solid var(--input-border);\n  background-color: var(--input-bg);\n}\n\n.input:focus {\n  border-color: var(--input-focus);\n  outline: none;\n}\n\n.input::placeholder {\n  color: var(--input-placeholder);\n}\n\n.input:disabled {\n  background-color: #f5f5f5;\n  color: #ccc;\n}', '适用于常见的表单输入框，支持各种状态', 'input,form,focus,disabled', 1, 100, 1),

('简约导航栏样式模板', 'layout', 'css', '简洁清爽的导航栏，支持响应式设计和悬停效果', '/* CSS变量 */\n:root {\n  --nav-bg: #fff;\n  --nav-text: #333;\n  --nav-hover: #007bff;\n  --nav-padding: 10px 20px;\n}\n\n/* 导航栏样式 */\n.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background-color: var(--nav-bg);\n  padding: var(--nav-padding);\n}\n\n.navbar__item {\n  color: var(--nav-text);\n  text-decoration: none;\n  margin: 0 10px;\n  padding: 10px 20px;\n  transition: color 0.3s ease;\n}\n\n.navbar__item:hover {\n  color: var(--nav-hover);\n}\n\n/* 响应式设计 */\n@media (max-width: 768px) {\n  .navbar {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n}', '适用于简约风格的导航栏，兼容桌面和移动端', 'navbar,layout,responsive,hover', 1, 100, 1),

('优雅的加载动画模板', 'animation', 'css', '简约的加载动画效果，适用于各种加载场景', '/* 旋转加载动画 */\n.loader--spinner {\n  width: 40px;\n  height: 40px;\n  border: 4px solid #f3f3f3;\n  border-top: 4px solid #007bff;\n  border-radius: 50%;\n  animation: spin 1s linear infinite;\n}\n\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}', '适用于页面加载时的旋转动画效果', 'loading,animation,spinner', 1, 100, 1),

('极简幽灵按钮', 'component', 'css', '无背景的极简幽灵按钮，适合次级操作或弱强调场景', ':root {\n  --{{ghost-btn}}-color: #2563eb;\n  --{{ghost-btn}}-border: 1px solid #dbeafe;\n}\n\n.{{ghost-btn}} {\n  padding: 8px 16px;\n  background: transparent;\n  color: var(--{{ghost-btn}}-color);\n  border: var(--{{ghost-btn}}-border);\n  border-radius: 6px;\n  font-size: 14px;\n  cursor: pointer;\n}\n\n.{{ghost-btn}}:hover {\n  background: rgba(37, 99, 235, 0.08);\n}', '适合工具栏、弹窗取消操作、次要按钮', 'button,ghost,minimal', 1, 90, 1),

('柔和阴影信息卡片', 'component', 'css', '低对比阴影卡片，适合内容展示，阅读友好', ':root {\n  --{{soft-card}}-bg: #ffffff;\n  --{{soft-card}}-shadow: 0 6px 20px rgba(0,0,0,.06);\n}\n\n.{{soft-card}} {\n  background: var(--{{soft-card}}-bg);\n  border-radius: 12px;\n  padding: 20px;\n  box-shadow: var(--{{soft-card}}-shadow);\n}', '文章列表、设置项、数据展示卡片', 'card,shadow,content', 1, 90, 1),

('细边框输入框', 'component', 'css', '轻量级输入框，适合后台与设计系统', ':root {\n  --{{thin-input}}-border: #e5e7eb;\n  --{{thin-input}}-focus: #2563eb;\n}\n\n.{{thin-input}} {\n  width: 100%;\n  padding: 8px 10px;\n  border-radius: 6px;\n  border: 1px solid var(--{{thin-input}}-border);\n}\n\n.{{thin-input}}:focus {\n  border-color: var(--{{thin-input}}-focus);\n  outline: none;\n}', '后台表单、设置页、搜索框', 'input,form,system', 1, 85, 1),

('纵向分组列表', 'layout', 'css', '类似系统设置页的纵向分组列表样式', '.{{list}} {\n  border-radius: 10px;\n  overflow: hidden;\n  background: #fff;\n}\n\n.{{list}}__item {\n  padding: 14px 16px;\n  border-bottom: 1px solid #f1f5f9;\n}\n\n.{{list}}__item:last-child {\n  border-bottom: none;\n}', '设置页、账户信息、偏好配置', 'list,layout,settings', 1, 85, 1),

('顶部提示条', 'component', 'css', '轻量级顶部提示信息条，不打断用户操作', ':root {\n  --{{notice}}-bg: #f0f9ff;\n  --{{notice}}-text: #0369a1;\n}\n\n.{{notice}} {\n  padding: 10px 16px;\n  background: var(--{{notice}}-bg);\n  color: var(--{{notice}}-text);\n  font-size: 14px;\n}', '系统公告、操作反馈、轻提示', 'notice,info,feedback', 1, 80, 1),

('极简分页器', 'component', 'css', '无图标的文本型分页器，干净克制', '.{{pager}} {\n  display: flex;\n  gap: 8px;\n}\n\n.{{pager}}__item {\n  padding: 6px 10px;\n  border-radius: 6px;\n  cursor: pointer;\n}\n\n.{{pager}}__item--active {\n  background: #2563eb;\n  color: #fff;\n}', '后台列表、数据表格分页', 'pagination,table,backend', 1, 80, 1),

('空状态占位样式', 'component', 'css', '内容为空时的占位展示，低干扰感', '.{{empty}} {\n  text-align: center;\n  color: #9ca3af;\n  padding: 40px 0;\n  font-size: 14px;\n}', '列表为空、搜索无结果', 'empty,state,placeholder', 1, 75, 1),

('胶囊标签样式', 'component', 'css', '轻量圆角标签，适合分类或状态展示', '.{{tag}} {\n  display: inline-block;\n  padding: 4px 10px;\n  font-size: 12px;\n  border-radius: 999px;\n  background: #f1f5f9;\n  color: #334155;\n}', '分类标签、状态标识', 'tag,label,pill', 1, 75, 1),

('图片自适应容器', 'utility', 'css', '保持图片比例的自适应容器', '.{{img-box}} {\n  position: relative;\n  padding-top: 56.25%;\n}\n\n.{{img-box}} img {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}', '封面图、卡片图片', 'image,ratio,utility', 1, 70, 1),

('低调淡入动画', 'animation', 'css', '页面元素出现时的轻微淡入动画', '.{{fade}} {\n  animation: {{fade}}-in .3s ease-out both;\n}\n\n@keyframes {{fade}}-in {\n  from { opacity: 0; transform: translateY(4px); }\n  to { opacity: 1; transform: none; }\n}', '列表加载、弹窗内容进入', 'animation,fade,ui', 1, 70, 1),

('后台主操作按钮', 'component', 'css', '后台系统常用主按钮，强调可读性与稳定反馈', ':root {\n  --{{admin-btn}}-bg: #2563eb;\n  --{{admin-btn}}-bg-hover: #1e40af;\n}\n\n.{{admin-btn}} {\n  padding: 8px 16px;\n  font-size: 14px;\n  color: #fff;\n  background: var(--{{admin-btn}}-bg);\n  border-radius: 6px;\n  border: none;\n  cursor: pointer;\n}\n\n.{{admin-btn}}:hover {\n  background: var(--{{admin-btn}}-bg-hover);\n}', '后台新增、保存、确认等主操作', 'admin,button,primary', 1, 100, 1),

('后台表格行样式', 'layout', 'css', '适合数据密集型后台的表格行样式', '.{{admin-row}} {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n  padding: 12px 16px;\n  border-bottom: 1px solid #f1f5f9;\n  font-size: 13px;\n  color: #334155;\n}\n\n.{{admin-row}}:hover {\n  background: #f8fafc;\n}', '后台列表、日志、订单行', 'admin,table,row', 1, 95, 1),

('后台筛选区容器', 'layout', 'css', '列表顶部筛选条件容器，结构清晰', '.{{filter-box}} {\n  display: flex;\n  gap: 12px;\n  padding: 12px;\n  background: #f8fafc;\n  border-radius: 8px;\n}', '后台列表筛选、搜索区域', 'admin,filter,layout', 1, 90, 1),

('后台状态徽标', 'component', 'css', '用于表示状态的小型徽标标签', '.{{admin-badge}} {\n  padding: 2px 8px;\n  font-size: 12px;\n  border-radius: 999px;\n  background: #e5e7eb;\n  color: #374151;\n}', '订单状态、启用/禁用标识', 'admin,badge,status', 1, 85, 1),

('官网主视觉按钮', 'component', 'css', '用于官网 Banner 的高辨识度按钮', '.{{hero-btn}} {\n  padding: 12px 28px;\n  font-size: 16px;\n  border-radius: 999px;\n  background: linear-gradient(135deg, #6366f1, #2563eb);\n  color: #fff;\n  border: none;\n  cursor: pointer;\n}', '官网首屏 CTA 按钮', 'website,cta,button', 1, 100, 1),

('官网内容区块容器', 'layout', 'css', '官网模块化内容区块样式', '.{{section}} {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 80px 24px;\n}', '官网功能介绍、说明模块', 'website,section,layout', 1, 95, 1),

('官网特性卡片', 'component', 'css', '用于展示产品特性的简洁卡片', '.{{feature-card}} {\n  padding: 32px;\n  border-radius: 20px;\n  background: #ffffff;\n  box-shadow: 0 20px 40px rgba(0,0,0,.06);\n}', '产品优势、功能亮点', 'website,feature,card', 1, 90, 1),

('官网页脚链接列表', 'layout', 'css', '简约官网页脚链接样式', '.{{footer-links}} {\n  display: grid;\n  gap: 8px;\n  font-size: 14px;\n  color: #64748b;\n}', '官网页脚导航', 'website,footer,links', 1, 85, 1),

('移动端主按钮', 'component', 'css', '适合拇指操作的移动端按钮', '.{{mobile-btn}} {\n  width: 100%;\n  padding: 14px 0;\n  font-size: 16px;\n  border-radius: 12px;\n  background: #2563eb;\n  color: #fff;\n  border: none;\n}', '移动端提交、确认操作', 'mobile,button,primary', 1, 100, 1),

('移动端列表项', 'layout', 'css', '适合手指滑动浏览的列表项样式', '.{{mobile-item}} {\n  padding: 16px;\n  border-bottom: 1px solid #f1f5f9;\n  font-size: 15px;\n}', '消息列表、设置列表', 'mobile,list,item', 1, 95, 1),

('移动端顶部栏', 'layout', 'css', 'App 风格顶部栏，固定高度', '.{{mobile-header}} {\n  height: 48px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 16px;\n  font-weight: 500;\n}', 'App 页面标题栏', 'mobile,header,app', 1, 90, 1),

('移动端底部操作栏', 'layout', 'css', '固定在底部的操作区域', '.{{mobile-footer}} {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding: 12px 16px;\n  background: #ffffff;\n  border-top: 1px solid #e5e7eb;\n}', '提交栏、购买栏', 'mobile,footer,action', 1, 90, 1);
