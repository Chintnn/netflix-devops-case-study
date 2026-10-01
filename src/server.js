const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`netflix-service v${process.env.APP_VERSION || '1.0.0'} listening on ${PORT}`);
});