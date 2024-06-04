import { Button } from '@/components/ui/button';

type Props = {
  href: string;
  icon?: boolean;
  blank?: boolean;
  rel?: string;
  label?: string;
  children?: React.ReactNode;
};

const ButtonLink = ({ href, icon, blank, rel, label, children }: Props) => {
  return (
    <div className="flex justify-center mt-6">
      <Button
        variant="outline"
        className="bg-transparent"
        size={icon ? 'icon' : undefined}
        asChild
      >
        <a
          href={href}
          target={blank ? '_blank' : undefined}
          rel={rel}
          aria-label={label}
        >
          {children}
        </a>
      </Button>
    </div>
  );
};

export default ButtonLink;
