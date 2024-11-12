# Bagruv rozvrh
Using eXtreme Go Horse

This Git repository contains a backup schedule application that caches data from the Bakalari API and is served by Cloudflare Workers. The schedule is available even when the Bakalari API is down or undergoing updates, making it a useful tool for students who need to find their classes when the Bakalari system is unavailable.

## Usage
The application will automatically retrieve and cache the schedule data from the Bakalari API. You can then access the schedule through the Cloudflare Workers endpoint.

In case of Bakalari API being down, it will use the cached schedule data.

## Contributing
If you would like to contribute to the project, please fork the repository and submit a pull request.

## License
This project is licensed under the [DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE](./LICENSE).
