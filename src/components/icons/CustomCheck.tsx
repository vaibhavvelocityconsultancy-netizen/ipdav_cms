const CustomCheck = ({
  className = "",
  size = 16,
}) => {
  return (
    <img
      src="newweb/checked.svg"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
};

export default CustomCheck;