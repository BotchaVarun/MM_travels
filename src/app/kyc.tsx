import { BackHeader } from '@/components/ui/BackHeader';
import { Button } from '@/components/ui/Button';
import { colors, radius, spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock types for document state
type DocStatus = 'Not uploaded' | 'Uploaded' | 'Verified' | 'Rejected';

interface DocumentType {
    id: string;
    title: string;
    caption: string;
    status: DocStatus;
    icon: keyof typeof Ionicons.glyphMap;
}

export default function KYCScreen() {
    const router = useRouter();

    // State for the two required documents
    const [documents, setDocuments] = useState<DocumentType[]>([
        {
            id: 'dl',
            title: 'Driving License',
            caption: 'Front & back required',
            status: 'Not uploaded',
            icon: 'car-outline',
        },
        {
            id: 'id',
            title: 'Government ID',
            caption: 'Aadhaar, Passport, or Voter ID',
            status: 'Not uploaded',
            icon: 'card-outline',
        },
    ]);

    // Modal & Camera Mocks
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isPreviewActive, setIsPreviewActive] = useState(false);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);

    // Derived state to map the overall KYC banner
    const uploadedCount = documents.filter((d) => d.status !== 'Not uploaded').length;
    const isKycComplete = uploadedCount === 2;

    const handleDocumentTap = (doc: DocumentType) => {
        if (doc.status === 'Uploaded' || doc.status === 'Verified') return; // Prevent re-upload if pending/verified
        setActiveDocId(doc.id);
        setIsCameraActive(true);
    };

    const handleCaptureMock = () => {
        setIsCameraActive(false);
        setIsPreviewActive(true);
    };

    const handleUsePhotoMock = () => {
        setDocuments((prev) =>
            prev.map((doc) =>
                doc.id === activeDocId ? { ...doc, status: 'Uploaded' } : doc
            )
        );
        setIsPreviewActive(false);
        setActiveDocId(null);
    };

    const navigateToHome = () => {
        // Navigate strictly to A7 Permissions following the logical flow
        router.replace('/permissions');
    };

    const renderStatusBanner = () => {
        if (uploadedCount === 0) return null;

        if (uploadedCount < 2) {
            // Partial completion banner
            return (
                <View style={styles.bannerPending}>
                    <Ionicons name="time-outline" size={20} color={colors.inkSoft} />
                    <Text style={styles.bannerPendingText}>1 of 2 documents uploaded</Text>
                </View>
            );
        }

        // Fully uploaded pending review
        return (
            <View style={styles.bannerPending}>
                <Ionicons name="time-outline" size={20} color={colors.inkSoft} />
                <Text style={styles.bannerPendingText}>Pending Verification</Text>
            </View>
        );
    };

    const getTagStyle = (status: DocStatus) => {
        switch (status) {
            case 'Uploaded':
            case 'Verified':
                return { bg: colors.greenTint, text: colors.greenInk };
            case 'Rejected':
                return { bg: colors.roseTint, text: colors.danger };
            case 'Not uploaded':
            default:
                return { bg: colors.surface, text: colors.inkSoft };
        }
    };

    return (
        <SafeAreaView edges={['top']} style={styles.container}>
            <BackHeader title="Identity verification" />

            <View style={styles.content}>
                {renderStatusBanner()}

                {/* Document Cards */}
                {documents.map((doc) => {
                    const tagStyle = getTagStyle(doc.status);
                    const isInteractable = doc.status === 'Not uploaded' || doc.status === 'Rejected';

                    return (
                        <TouchableOpacity
                            key={doc.id}
                            activeOpacity={0.7}
                            onPress={() => handleDocumentTap(doc)}
                            disabled={!isInteractable}
                            style={styles.cardRow}
                        >
                            <View style={styles.iconSquare}>
                                <Ionicons name={doc.icon} size={24} color={colors.blue} />
                            </View>

                            <View style={styles.cardTextContainer}>
                                <Text style={styles.cardTitle}>{doc.title}</Text>
                                <Text style={styles.cardCaption}>{doc.caption}</Text>
                            </View>

                            <View style={[styles.tag, { backgroundColor: tagStyle.bg }]}>
                                <Text style={[styles.tagText, { color: tagStyle.text }]}>{doc.status}</Text>
                            </View>

                            {isInteractable && (
                                <Ionicons name="chevron-forward" size={16} color={colors.inkFaint} style={{ marginLeft: 8 }} />
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Footer Note */}
                <View style={{ flex: 1 }} />
                <Text style={styles.footerNote}>
                    <Ionicons name="lock-closed" size={10} /> Documents are encrypted and only used for verification.
                </Text>

                <View style={styles.footerCTA}>
                    <Button
                        label="Complete Profile"
                        variant="gold"
                        disabled={!isKycComplete}
                        onPress={navigateToHome}
                    />
                </View>
            </View>

            {/* --- MOCK CAPTURE MODAL --- */}
            <Modal visible={isCameraActive} animationType="slide" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.cameraSheet}>
                        <View style={styles.dragHandle} />
                        <Text style={styles.sheetTitle}>Scan your Document</Text>

                        {/* Native camera stand-in (4:3 ratio) */}
                        <View style={styles.cameraPreview}>
                            {/* Dashed Gold Guide */}
                            <View style={styles.cameraGuide} />
                        </View>

                        {/* Shutter & Controls */}
                        <View style={styles.cameraControls}>
                            <TouchableOpacity style={styles.shutterButton} onPress={handleCaptureMock}>
                                <View style={styles.shutterInner} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setIsCameraActive(false)}>
                                <Text style={styles.galleryLink}>Choose from gallery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- MOCK PREVIEW MODAL --- */}
            <Modal visible={isPreviewActive} animationType="fade" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.cameraSheet}>
                        <Text style={styles.sheetTitle}>Preview Document</Text>

                        {/* Captured image mock */}
                        <View style={styles.capturedPreview}>
                            <Ionicons name="image-outline" size={48} color={colors.inkSoft} />
                            <Text style={{ color: colors.inkSoft, marginTop: 8 }}>Image Captured</Text>
                        </View>

                        <View style={styles.previewActions}>
                            <TouchableOpacity onPress={() => setIsPreviewActive(false)}>
                                <Text style={styles.retakeText}>Retake</Text>
                            </TouchableOpacity>
                            <Button
                                label="Use Photo"
                                variant="black"
                                onPress={handleUsePhotoMock}
                                style={{ minWidth: 140 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.screenPadX,
        paddingTop: 24,
    },
    bannerPending: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 14,
        marginBottom: 24,
        gap: 8,
    },
    bannerPendingText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.inkSoft,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: radius.card,
        marginBottom: 12,
        backgroundColor: colors.white,
    },
    iconSquare: {
        width: 42,
        height: 42,
        borderRadius: radius.iconSquare,
        backgroundColor: colors.blueTint,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.ink,
        marginBottom: 2,
    },
    cardCaption: {
        fontSize: 10,
        color: colors.inkFaint,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 9.5,
        fontWeight: '700',
    },
    footerNote: {
        fontSize: 10,
        color: colors.inkFaint,
        textAlign: 'center',
        marginBottom: 16,
    },
    footerCTA: {
        paddingBottom: 24,
    },
    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(16,27,48,0.4)', // Dimmed backdrop
        justifyContent: 'flex-end',
    },
    cameraSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingTop: 14,
        paddingHorizontal: 22,
        paddingBottom: 40,
        alignItems: 'center',
    },
    dragHandle: {
        width: 34,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E2E4E8',
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.ink,
        marginBottom: 20,
    },
    cameraPreview: {
        width: '100%',
        aspectRatio: 3 / 4,
        backgroundColor: colors.navy900,
        borderRadius: 12,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraGuide: {
        width: '85%',
        height: '60%',
        borderWidth: 2,
        borderColor: colors.gold,
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    capturedPreview: {
        width: '100%',
        aspectRatio: 3 / 4,
        backgroundColor: colors.surface,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraControls: {
        alignItems: 'center',
        marginTop: 30,
    },
    shutterButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.white,
        borderWidth: 4,
        borderColor: colors.ink,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    shutterInner: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.ink,
    },
    galleryLink: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.inkSoft,
    },
    previewActions: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
    },
    retakeText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.inkSoft,
        paddingHorizontal: 16,
    }
});
