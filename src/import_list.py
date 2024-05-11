
def get_word_list(file_path: str = "/ny_times/word_list.txt") -> list[str]:
    with open(file_path, "r") as f:
        return set(f.read().splitlines())

if __name__ == "__main__":
    import_list = get_word_list()
    print(import_list)
