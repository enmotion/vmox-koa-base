/**
 * @ Author: Your name
 * @ Create Time: 2025-04-15 16:31:05
 * @ Modified by: Your name
 * @ Modified time: 2025-04-15 17:53:19
 * @ Description:
 */
import * as colors from "colors";
import app from '../src/app';

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(colors.green.bold(`Server is running on http://localhost:${port}`));
});