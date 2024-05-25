import NavigationPc from '@/components/NavigationPc';

const Header = () => {
  return (
    <header className="fixed w-full bg-primary">
      <div className="container flex justify-between items-center py-2">
        <a href="/" className="text-white font-medium text-xl md:text-2xl">
          Rowicy
        </a>

        <NavigationPc />
      </div>
    </header>
  );
};

export default Header;
