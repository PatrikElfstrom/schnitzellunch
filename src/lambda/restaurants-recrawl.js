import axios from 'axios';

const sites = ['kvartersmenyn'];

const saveRestaurant = data =>
  axios
    .post(
      'https://schnitzellunch.patrikelfstrom.se/.netlify/functions/restaurants-add',
      data
    )
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });

export const handler = async () => {
  const sitesTimerStart = Date.now();
  let body = '';

  const message = message => {
    body += `\n${message}`;
    console.log(message);
  };

  return new Promise(resolve =>
    Promise.all(
      sites.map(async site => {
        const siteTimerStart = Date.now();

        return (
          axios
            .get(
              `https://schnitzellunch.patrikelfstrom.se/.netlify/functions/${site}`
            )
            // .catch(error => console.error(error));
            .then(({ data }) => saveRestaurant(data))
            .then(
              () =>
                message(
                  `${site} succeeded in ${(Date.now() - siteTimerStart) /
                    1000} seconds`
                ),
              error =>
                message(
                  `${site} failed in ${(Date.now() - siteTimerStart) /
                    1000} seconds - ${error}`
                )
            )
        );
      })
    ).then(() => {
      message(
        `Completed crawling ${sites.length} sites in ${(Date.now() -
          sitesTimerStart) /
          1000} seconds`
      );

      resolve({
        statusCode: 200,
        body
      });
    })
  );
};
