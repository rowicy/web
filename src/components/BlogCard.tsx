import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import member from '@/data/member';
import type { CollectionEntry } from 'astro:content';
type Props = {
  blog: CollectionEntry<'blog'>;
  color?: 'white';
};

const BlogCard = ({ blog, color }: Props) => {
  const author = member.find(m => m.name === blog.data.author);

  return (
    <Card className="bg-transparent transition hover:opacity-70">
      <a href={`/blog/${blog.slug}`} className="block p-6">
        <CardTitle
          className={`text-xl md:text-2xl ${color === 'white' && 'text-white'}`}
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
