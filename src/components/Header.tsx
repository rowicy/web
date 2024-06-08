import NavigationPc from '@/components/NavigationPc';
import NavigationSp from '@/components/NavigationSp';
import siteInfo from '@/data/siteInfo';

const Header = () => {
  return (
    <header className="fixed w-full bg-primary z-50">
      <div className="container flex justify-between items-center py-2">
        <a
          href="/"
          className="text-white font-medium text-xl md:text-2xl transition hover:opacity-70"
        >
          {siteInfo.appName}
        </a>

        <NavigationPc />

        <NavigationSp />
      </div>
    </header>
  );
};

export default Header;
