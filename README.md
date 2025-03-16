## Building the Project

To build the project, follow these steps:

1. **Install Dependencies**: Ensure you have all the necessary dependencies installed. You can do this by running:
    ```sh
    npm install
    ```

2. **Build the Project**: Use the following command to build the project:
    ```sh
    npm run build
    ```

This will use Rollup to bundle the project according to the configuration specified in `rollup.config.js`.

3. **Move the Built File**: After building, move the generated file `./build/bdiscord-ai.plugin.js` to your Better Discord plugin folder. The location of this folder depends on your operating system:
    - **Windows**: `%AppData%/BetterDiscord/plugins`
    - **macOS**: `~/Library/Application Support/BetterDiscord/plugins`
    - **Linux**: `~/.config/BetterDiscord/plugins`