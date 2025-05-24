import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Props = {
  src: string;
  alt?: string;
  fallbackText: string;
};

const MemberAvatar = ({ src, alt, fallbackText }: Props) => {
  return (
    <Avatar className="mx-auto h-32 max-h-full w-32 max-w-full">
      <AvatarImage src={src} alt={alt} className="object-cover" />
      <AvatarFallback>{fallbackText}</AvatarFallback>
    </Avatar>
  );
};

export default MemberAvatar;
