import "./Loading.scss";

interface LoadingProps {
  text?: string;
}

const Loading = (props: LoadingProps) => {
  const { text } = props;
  return (
    <div className="lds-circle">
      <div></div>
      {text && <h2 className="loading__text">{text}</h2>}
    </div>
  );
};

export default Loading;
