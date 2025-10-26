import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import member, { type members } from '@/data/member';

type Props = {
  memberName: (typeof members)[number];
};

const MemberIcon = ({ memberName }: Props) => {
  const data = member.find(m => m.name === memberName);

  return (
    <Avatar>
      <AvatarImage
        src={
          data?.image ||
          `https://placehold.jp/020817/ffffff/300x300.png?text=${data?.name}`
        }
        alt={data?.name}
        className="object-cover"
      />
      <AvatarFallback>{data?.name}</AvatarFallback>
    </Avatar>
  );
};

export default MemberIcon;
