import { createContext, useContext } from "react";

export const SalesOrderB2BFormContext = createContext<{
  page: "create" | "edit";
}>({
  page: "create",
});

export const SalesOrderB2BFormProvider = ({
  children,
  page,
}: {
  page: "create" | "edit";
  children: React.ReactNode;
}) => {
  return (
    <SalesOrderB2BFormContext.Provider value={{ page }}>
      {children}
    </SalesOrderB2BFormContext.Provider>
  );
};

export const useSalesOrderB2BForm = () => {
  const context = useContext(SalesOrderB2BFormContext);

  if (!context) {
    throw new Error(
      "useSalesOrderB2BForm must be used within a SalesOrderB2BFormProvider",
    );
  }

  return context;
};
