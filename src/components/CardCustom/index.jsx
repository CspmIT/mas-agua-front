import { Box } from "@mui/material";

function CardCustom({ children, className }) {
  return <Box className={`bg-white dark:bg-zinc-700 shadow-[2px_3px_5px_0px_#0000001f] ${className ?? ''}`}>{children}</Box>;
}
export default CardCustom;
