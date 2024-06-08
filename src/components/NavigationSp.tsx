import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import headerLink from '@/data/headerLink';

const NavigationSp = () => {
  return (
    <div className="md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger className="text-white">Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          {headerLink.map(link => {
            return (
              <DropdownMenuItem key={link.name} className="p-0">
                <a href={link.href} className="w-full p-2">
                  {link.name}
                </a>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NavigationSp;
