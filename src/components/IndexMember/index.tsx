import {
  TooltipProvider,
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import MemberAvatar from '@/components/MemberAvatar';
import member from '@/data/member';

export default function IndexMember() {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap justify-center gap-4">
        {member.map(({ name, image }) => (
          <div className="size-32" key={name}>
            <UiTooltip>
              <TooltipTrigger asChild>
                <a href={`/member#${name}`}>
                  <MemberAvatar
                    src={
                      image ||
                      `https://placehold.jp/020817/ffffff/300x300.png?text=${name}`
                    }
                    alt={name}
                    fallbackText={name}
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </UiTooltip>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
