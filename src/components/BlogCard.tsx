import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import member from '@/data/member';
import type { CollectionEntry } from 'astro:content';
type Props = {
  blog: CollectionEntry<'blog'>;
  bg?: 'transparent';
};

const BlogCard = ({ blog, bg }: Props) => {
  const author = member.find(m => m.name === blog.data.author);

  return (
    <Card
      className={`transition hover:opacity-70 ${bg === 'transparent' && 'bg-transparent'}`}
    >
      <a href={`/blog/${blog.slug}`} className="block p-6">
        <CardTitle className={`${bg === 'transparent' && 'text-white'}`}>
          {blog.data.title}
        </CardTitle>
        <div className="flex flex-col mt-3 gap-3">
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
