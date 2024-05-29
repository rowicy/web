import headerLink from '@/data/headerLink';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const NavigationPc = () => {
  return (
    <NavigationMenu className="hidden md:block">
      <NavigationMenuList>
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
  );
};

export default NavigationPc;
