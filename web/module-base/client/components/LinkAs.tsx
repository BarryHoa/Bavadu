import clsx from "clsx";
import Link, { LinkProps } from "next/link";

const LinkAs = (
  props: LinkProps & {
    className?: string;
    children: React.ReactNode;
    hrefAs?: any;
  },
) => {
  const { hrefAs, ...rest } = props;

  return (
    <Link
      {...rest}
      as={hrefAs ?? rest.as}
      className={clsx(
        "text-primary-600 cursor-pointer hover:text-danger-400",
        props.className,
      )}
    >
      {props.children}
    </Link>
  );
};

export default LinkAs;
