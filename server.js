const app = require('./api/index');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  She Can Foundation Backend Server Running!`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`  Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`=================================================`);
});
