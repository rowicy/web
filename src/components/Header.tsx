import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import headerLink from '@/data/headerLink';

const Header = () => {
  return (
    <header className="fixed w-full bg-primary">
      <div className="container flex justify-between items-center py-2">
        <a href="/" className="text-white font-medium text-xl md:text-2xl">
          Rowicy
        </a>

        <NavigationMenu>
          <NavigationMenuList>
            {/* PC */}
            {headerLink.map(link => {
              return (
                <NavigationMenuItem key={link.name}>
                  <NavigationMenuLink className="text-white" href={link.href}>
                    {link.name}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
};

export default Header;
