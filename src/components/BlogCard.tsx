import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import member from '@/data/member';
import type { CollectionEntry } from 'astro:content';
import MemberIcon from '@/components/MemberIcon';
import { cn } from '@/lib/utils';

type Props = {
  blog: CollectionEntry<'blog'>;
  color?: 'white';
};

const BlogCard = ({ blog, color }: Props) => {
  const author = member.find(m => m.name === blog.data.author);

  return (
    <Card className="relative bg-transparent transition hover:opacity-70">
      <a
        href={`/blog/${blog.slug}`}
        className="absolute block size-full"
        aria-label={`${blog.data.title} を読む`}
      >
        &nbsp;
      </a>
      <div className="p-6">
        <CardTitle
          className={cn(
            'text-xl md:text-2xl',
            color === 'white' && 'text-white'
          )}
        >
          {blog.data.title}
        </CardTitle>
        <div className="mt-3 flex flex-col gap-3">
          <CardDescription>
            <time dateTime={blog.data.pubDate}>
              {blog.data.pubDate.toString().slice(0, 10)}
            </time>
          </CardDescription>
          <div className="flex flex-wrap gap-1">
            {blog.data.tags.map(tag => {
              return (
                <a
                  href={`/blog/tag/${encodeURIComponent(tag)}`}
                  key={tag}
                  className="relative z-10"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      'transition hover:bg-gray-100',
                      color === 'white' && 'text-white'
                    )}
                  >
                    #{tag}
                  </Badge>
                </a>
              );
            })}
          </div>
          {author && (
            <CardDescription className="flex items-center">
              Author:&nbsp;
              <a
                href={`/blog/author/${author.name}`}
                className="relative z-10 inline-flex items-center gap-2 transition hover:underline"
              >
                {author.name}
                <MemberIcon memberName={author.name} />
              </a>
            </CardDescription>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BlogCard;
