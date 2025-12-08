import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import member from '@/data/member';
import type { CollectionEntry } from 'astro:content';
import MemberIcon from '@/components/MemberIcon';
import { ExternalLink } from 'lucide-react';

type Props = {
  blog: CollectionEntry<'blog'>;
  color?: 'white';
};

const BlogCard = ({ blog, color }: Props) => {
  const author = member.find(m => m.name === blog.data.author);
  const isExternal = !!blog.data.externalUrl;
  const href = isExternal ? blog.data.externalUrl : `/blog/${blog.slug}`;
  const linkProps = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Card className="bg-transparent transition hover:opacity-70">
      <a href={href} className="block p-6" {...linkProps}>
        <CardTitle
          className={`flex items-center gap-2 text-xl md:text-2xl ${color === 'white' && 'text-white'}`}
        >
          {blog.data.title}
          {isExternal && (
            <ExternalLink className="h-5 w-5 flex-shrink-0" aria-label="外部記事" />
          )}
        </CardTitle>
        <div className="mt-3 flex flex-col gap-3">
          <CardDescription>
            <time dateTime={blog.data.pubDate}>
              {blog.data.pubDate.toString().slice(0, 10)}
            </time>
          </CardDescription>
          <div className="flex flex-wrap gap-1">
            {isExternal && (
              <Badge
                variant="default"
                className={`${color === 'white' && 'text-white'}`}
              >
                外部記事
              </Badge>
            )}
            {blog.data.tags.map(tag => {
              return (
                <Badge
                  variant="outline"
                  className={`${color === 'white' && 'text-white'}`}
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
                <MemberIcon memberName={author.name} />
              </span>
            </CardDescription>
          )}
        </div>
      </a>
    </Card>
  );
};

export default BlogCard;
