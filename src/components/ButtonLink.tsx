import { Button } from '@/components/ui/button';

type Props = {
  href: string;
  text: string;
};

const ButtonLink = ({ href, text }: Props) => {
  return (
    <div className="flex justify-center mt-6">
      <Button variant="outline" className="bg-transparent" asChild>
        <a href={href}>{text}</a>
      </Button>
    </div>
  );
};

export default ButtonLink;
