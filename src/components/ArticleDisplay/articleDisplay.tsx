import { Link } from "react-router-dom";

interface ArticleDisplayProps {
  image: string;
  title: string;
  articleInfo: string;
  description: string;
  articleId: string | number;
}
const ArticleDisplay = (props: ArticleDisplayProps) => {
  const { image, title, articleInfo, description, articleId } = props;

  return (
    <Link className="article" to={`article/${articleId}`}>
      <img src={image} alt="article1" />
      <h3 className="articleTitle">{title}</h3>
      <p className="articleInfo">{articleInfo}</p>
      <p className="articleDescription">{description}</p>
    </Link>
  );
};

export default ArticleDisplay;
