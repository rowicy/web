import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import type { Frontmatter } from '@/types/Frontmatter';
import { Badge } from '@/components/ui/badge';
import member from '@/data/member';
type Props = {
  url: string;
  frontmatter: Frontmatter;
  bg?: 'transparent';
};

const BlogCard = ({ url, frontmatter, bg }: Props) => {
  const author = member.find(m => m.name === frontmatter.author);

  return (
    <Card
      className={`transition hover:opacity-70 ${bg === 'transparent' && 'bg-transparent'}`}
    >
      <a href={url} className="block p-6">
        <CardTitle className={`${bg === 'transparent' && 'text-white'}`}>
          {frontmatter.title}
        </CardTitle>
        <div className="flex flex-col mt-3 gap-3">
          <CardDescription>
            <time dateTime={frontmatter.pubDate}>
              {frontmatter.pubDate.toString().slice(0, 10)}
            </time>
          </CardDescription>
          <div className="flex flex-wrap gap-1">
            {frontmatter.tags.map(tag => {
              return (
                <Badge
                  variant="outline"
                  className={`${bg === 'transparent' && 'text-white'}`}
                  key={tag}
                >
                  #{tag}
                </Badge>
              );
            })}
          </div>
          {author && (
            <CardDescription className="flex items-center">
              Author:&nbsp;
              <span className="inline-flex items-center gap-2">
                {author.name}
                <Avatar>
                  <AvatarImage
                    src={
                      author.image ||
                      `https://placehold.jp/020817/ffffff/300x300.png?text=${author.name}`
                    }
                    alt={author.name}
                    className="object-cover"
                  />
                  <AvatarFallback>{author.name}</AvatarFallback>
                </Avatar>
              </span>
            </CardDescription>
          )}
        </div>
      </a>
    </Card>
  );
};

export default BlogCard;
