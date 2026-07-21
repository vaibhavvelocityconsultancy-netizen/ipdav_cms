import requests
from bs4 import BeautifulSoup

def decode_secret_message(url):
    response = requests.get(url)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    rows = soup.find_all("tr")

    points = []

    # Skip table header
    for row in rows[1:]:
        cols = row.find_all("td")

        if len(cols) == 3:
            try:
                x = int(cols[0].get_text(strip=True))
                char = cols[1].get_text(strip=True)
                y = int(cols[2].get_text(strip=True))

                points.append((char, x, y))

            except:
                pass

    max_x = max(x for _, x, _ in points)
    max_y = max(y for _, _, y in points)

    # Create empty grid
    grid = [[" " for _ in range(max_x + 1)] for _ in range(max_y + 1)]

    # Fill grid
    for char, x, y in points:
        if char == "█":
            grid[y][x] = "#"
        else:
            grid[y][x] = " "

    # Print output
    for row in grid:
        print("".join(row))


decode_secret_message(
    "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub"
)