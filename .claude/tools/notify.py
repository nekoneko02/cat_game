import sys
from plyer import notification


def main():
    if len(sys.argv) < 2:
        print("使い方: python notify.py <通知メッセージ> [タイトル]")
        sys.exit(1)

    message = sys.argv[1]
    title = sys.argv[2] if len(sys.argv) > 2 else "通知"

    notification.notify(title=title, message=message, timeout=5)  # 秒


if __name__ == "__main__":
    main()
