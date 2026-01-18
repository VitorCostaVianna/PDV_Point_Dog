@echo off
echo Iniciando Point Dog PDV...
:: -Xmx512m limita o Java a usar no MÁXIMO 512MB de RAM
java -Xmx512m -jar target/sistema-gerenciamento-point-dog-0.0.1-SNAPSHOT.jar
pause