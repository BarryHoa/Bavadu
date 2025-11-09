import clsx from "clsx";
import Link, { LinkProps } from "next/link";

const LinkAs = (
  props: LinkProps & { className?: string; children: React.ReactNode }
) => {
  return (
    <Link
      {...props}
      className={clsx(
        "text-primary-600 cursor-pointer hover:text-danger-400",
        props.className
      )}
    >
      {props.children}
    </Link>
  );
};

export default LinkAs;
