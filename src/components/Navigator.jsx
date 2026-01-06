import React, { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import './Navigator.scss';

const MenuGroup = ({ name, children, icon }) => {
  return (
    <li className="menu-group">
      <div className="menu-group-name">
        {icon && <i className={icon}></i>}
        <FormattedMessage id={name} />
      </div>
      <ul className="menu-list list-unstyled">{children}</ul>
    </li>
  );
};

const Menu = ({
  name,
  active,
  link,
  children,
  onClick,
  hasSubMenu,
  onLinkClick,
}) => {
  return (
    <li
      className={
        'menu' +
        (hasSubMenu ? ' has-sub-menu' : '') +
        '' +
        (active ? ' active' : '')
      }
    >
      {hasSubMenu ? (
        <Fragment>
          <span
            data-toggle="collapse"
            className={'menu-link collapsed'}
            onClick={onClick}
            aria-expanded={'false'}
          >
            <FormattedMessage id={name} />
            <div className="icon-right">
              <i className={'fa-solid fa-angle-right'} />
            </div>
          </span>
          <div>
            <ul className="sub-menu-list list-unstyled">{children}</ul>
          </div>
        </Fragment>
      ) : (
        <Link to={link} className="menu-link" onClick={onLinkClick}>
          <FormattedMessage id={name} />
        </Link>
      )}
    </li>
  );
};

const SubMenu = ({ name, link, onLinkClick }) => {
  const location = useLocation();
  const isActive = location.pathname === link ? 'active' : '';

  return (
    <li className={'sub-menu ' + isActive}>
      <Link to={link} className="sub-menu-link" onClick={onLinkClick}>
        <FormattedMessage id={name} />
      </Link>
    </li>
  );
};

const Navigator = React.forwardRef(({ menus, onLinkClick }, ref) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState({});

  const toggle = (groupIndex, menuIndex) => {
    const needExpand = !(expandedMenu[groupIndex + '_' + menuIndex] === true);
    if (needExpand) {
      setExpandedMenu({
        [groupIndex + '_' + menuIndex]: true,
      });
    } else {
      setExpandedMenu({});
    }
  };

  const isMenuHasSubMenuActive = (subMenus, link) => {
    if (subMenus) {
      if (subMenus.length === 0) {
        return false;
      }

      const currentPath = location.pathname;
      for (let i = 0; i < subMenus.length; i++) {
        const subMenu = subMenus[i];
        if (subMenu.link === currentPath) {
          return true;
        }
      }
    }

    if (link) {
      return location.pathname === link;
    }

    return false;
  };

  const checkActiveMenu = () => {
    outerLoop: for (let i = 0; i < menus.length; i++) {
      const group = menus[i];
      if (group.menus && group.menus.length > 0) {
        for (let j = 0; j < group.menus.length; j++) {
          const menu = group.menus[j];
          if (menu.subMenus && menu.subMenus.length > 0) {
            if (isMenuHasSubMenuActive(menu.subMenus, null)) {
              const key = i + '_' + j;
              setExpandedMenu({
                [key]: true,
              });
              break outerLoop;
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    checkActiveMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <Fragment>
      <ul className="navigator-menu list-unstyled">
        {menus.map((group, groupIndex) => {
          return (
            <Fragment key={groupIndex}>
              <MenuGroup name={group.name} icon={group.icon}>
                {group.menus
                  ? group.menus.map((menu, menuIndex) => {
                      const hasSubMenuActive = isMenuHasSubMenuActive(
                        menu.subMenus,
                        menu.link
                      );
                      const isSubMenuOpen =
                        expandedMenu[groupIndex + '_' + menuIndex] === true;
                      return (
                        <Menu
                          key={menuIndex}
                          active={hasSubMenuActive}
                          name={menu.name}
                          link={menu.link}
                          hasSubMenu={menu.subMenus}
                          isOpen={isSubMenuOpen}
                          onClick={() => toggle(groupIndex, menuIndex)}
                          onLinkClick={onLinkClick}
                        >
                          {menu.subMenus &&
                            menu.subMenus.map((subMenu, subMenuIndex) => (
                              <SubMenu
                                key={subMenuIndex}
                                name={subMenu.name}
                                link={subMenu.link}
                                onLinkClick={onLinkClick}
                              />
                            ))}
                        </Menu>
                      );
                    })
                  : null}
              </MenuGroup>
            </Fragment>
          );
        })}
      </ul>
    </Fragment>
  );
});

Navigator.displayName = 'Navigator';

export default Navigator;
