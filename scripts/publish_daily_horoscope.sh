#!/bin/bash
# Script para publicar el horóscopo diario en Twitter/X usando entorno limpio
cd /var/www/NebulosaMagica
env $(cat backend/.env.twitter.test | xargs) node backend/src/scripts/publishDailyHoroscope.js
