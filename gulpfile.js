const gulp          = require("gulp");
const merge         = require("merge-stream");
const browserSync   = require("browser-sync").create();
const $             = require("gulp-load-plugins")();
const autoprefixer  = require("autoprefixer");
const rev           = require("gulp-rev");
const fingerprint   = require("gulp-fingerprint");

const sassPaths = [
  "node_modules/foundation-sites/scss",
  "node_modules/motion-ui/src"
];

function sass() {
  return gulp.src("scss/app.scss")
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: "compressed" // if css compressed **file size**
    })
      .on("error", $.sass.logError))
    .pipe($.postcss([
      autoprefixer({ browsers: ["last 2 versions", "ie >= 9"] })
    ]))
    .pipe(gulp.dest("dist/assets"))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: "./dist"
  });

  gulp.watch("scss/*.scss", sass);
  gulp.watch("*.html", rebase);
}

function rebase() {
  const assets = gulp.src([
    "assets/*",
    "css/*.css",
    "js/*.js",
    "node_modules/jquery/dist/jquery.js",
    "node_modules/what-input/dist/what-input.js",
    "node_modules/foundation-sites/dist/js/foundation.js",
  ]).pipe(gulp.dest("dist/assets"))
      .pipe(browserSync.stream());
  const base = gulp.src(["index.html", "favicon.ico", "CNAME"])
      .pipe(gulp.dest("dist"))
      .pipe(browserSync.stream());

  return merge(assets, base);
}

gulp.task("sass", sass);
gulp.task("serve", gulp.series("sass", rebase, serve));
gulp.task("default", gulp.series("sass", rebase, serve));

function doRev() {
  return gulp.src([
    "dist/assets/*",
  ], {base: "dist"})
      .pipe(rev())
      .pipe(gulp.dest("dist"))
      .pipe(rev.manifest())
      .pipe(gulp.dest("dist"));
}

function doFingerPrint() {
  const manifest = require("./dist/rev-manifest");
  return gulp.src("dist/index.html")
      .pipe(fingerprint(manifest, {
        base: "/assets",
      }))
      .pipe(gulp.dest("dist"));
}

gulp.task("dist", gulp.series(sass, rebase, doRev, doFingerPrint));
