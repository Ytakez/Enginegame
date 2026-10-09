/* ==================== ПЛАВНОЕ ЗАТУХАНИЕ ==================== */
/* Множитель громкости — падает вместе с оборотами при глушении */
var volMultiplier = 1;

if(S.ignitionState === 'stopping'){
  /* Мотор глохнет — громкость прямо по оборотам */
  volMultiplier = Math.max(0, S.rpm / 4000);
} else if(S.ignitionState === 'off' && !S.running){
  volMultiplier = 0;
}