import NavigationPc from '@/components/NavigationPc';
import NavigationSp from '@/components/NavigationSp';

const Header = () => {
  return (
    <header className="fixed w-full bg-primary z-50">
      <div className="container flex justify-between items-center py-2">
        <a href="/" className="text-white font-medium text-xl md:text-2xl">
          Rowicy
        </a>

        <NavigationPc />

        <NavigationSp />
      </div>
    </header>
  );
};

export default Header;
