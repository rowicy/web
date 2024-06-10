import NavigationPc from '@/components/NavigationPc';
import NavigationSp from '@/components/NavigationSp';
import siteInfo from '@/data/siteInfo';

type Props = {
  children: React.ReactNode;
};

const Header = ({ children }: Props) => {
  return (
    <header className="fixed w-full bg-primary z-50">
      <div className="container flex justify-between items-center py-2 gap-6">
        <a
          href="/"
          className="text-white font-medium text-xl md:text-2xl transition hover:opacity-70"
        >
          {siteInfo.appName}
        </a>

        <NavigationPc />

        <div className="ml-auto md:ml-0">{children}</div>

        <NavigationSp />
      </div>
    </header>
  );
};

export default Header;
