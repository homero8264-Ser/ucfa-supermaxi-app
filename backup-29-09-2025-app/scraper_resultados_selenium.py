# filepath: d:\DATOS DE USUARIO\Documents\ucfa-supermaxi-app\scraper_resultados_selenium.py
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# Configura el servicio de Chrome usando webdriver_manager
s = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=s)

# Accede a la página web
url = "https://www.ucfa.org.ar/web/division/SM"
driver.get(url)

# Obtiene el HTML de la página
html = driver.page_source

# Cierra el navegador
driver.quit()

# Imprime el HTML en la consola
print(html)