import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Props = {
  src: string;
  alt?: string;
  fallbackText: string;
};

const MemberAvatar = ({ src, alt, fallbackText }: Props) => {
  return (
    <Avatar className="w-40 h-40 max-w-full max-h-full mx-auto">
      <AvatarImage src={src} alt={alt} className="object-cover" />
      <AvatarFallback>{fallbackText}</AvatarFallback>
    </Avatar>
  );
};

export default MemberAvatar;
