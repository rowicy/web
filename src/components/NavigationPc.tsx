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
      <NavigationMenuList className="space-x-6">
        {headerLink.map(link => {
          return (
            <NavigationMenuItem key={link.name}>
              <NavigationMenuLink
                className="text-white transition hover:opacity-70"
                href={link.href}
              >
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
