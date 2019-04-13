for filename in datasets/*.json; do
    echo "Processing $filename..."
    cat $filename | jq -c '.[]' | python publish_to_aws_topic_par.py
    mv -f "$filename" "$filename.DONE"
    echo "Done processing $filename..."
done