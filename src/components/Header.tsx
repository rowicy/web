import NavigationPc from '@/components/NavigationPc';
import NavigationSp from '@/components/NavigationSp';
import siteInfo from '@/data/siteInfo';
import Logo from '@/components/Logo';

type Props = {
  children: React.ReactNode;
};

const Header = ({ children }: Props) => {
  return (
    <header className="fixed z-50 w-full bg-primary">
      <div className="container flex items-center justify-between gap-6 py-2">
        <a
          href="/"
          className="flex items-center gap-1 text-xl font-medium text-white transition hover:opacity-70 md:text-2xl"
        >
          <Logo color="#fff" />
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
